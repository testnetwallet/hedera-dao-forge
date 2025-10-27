import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import {
  Client,
  PrivateKey,
  AccountId,
  TopicMessageSubmitTransaction,
} from "npm:@hashgraph/sdk@^2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { daoId, title, description } = await req.json();

    console.log('Submitting proposal:', { daoId, title, description });

    // Get DAO details
    const { data: dao, error: daoError } = await supabase
      .from('daos')
      .select('*')
      .eq('id', daoId)
      .single();

    if (daoError || !dao) throw new Error('DAO not found');

    // Check if user is a member
    const { data: member, error: memberError } = await supabase
      .from('dao_members')
      .select('*')
      .eq('dao_id', daoId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) throw new Error('Not a DAO member');

    // Initialize Hedera client
const operatorId = AccountId.fromString(Deno.env.get('HEDERA_OPERATOR_ID')!);
const rawKey = Deno.env.get('HEDERA_OPERATOR_KEY')!;
let operatorKey: PrivateKey;
try {
  operatorKey = PrivateKey.fromString(rawKey);
} catch (_e1) {
  try {
    operatorKey = PrivateKey.fromStringED25519(rawKey);
  } catch (_e2) {
    throw new Error('Invalid HEDERA_OPERATOR_KEY format. Provide DER hex (starting with 302e...) or raw Ed25519 private key.');
  }
}
const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    // Calculate quorum and end time
    const quorumRequired = Math.floor((dao.initial_supply * dao.quorum_percentage) / 100);
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + dao.voting_period_days);

    // Create proposal in database first
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .insert({
        dao_id: daoId,
        proposer_id: user.id,
        title,
        description,
        quorum_required: quorumRequired,
        ends_at: endsAt.toISOString(),
        status: 'active',
      })
      .select()
      .single();

    if (proposalError) throw proposalError;

    // Submit proposal to HCS topic
    const proposalMessage = JSON.stringify({
      type: 'proposal',
      proposalId: proposal.id,
      title,
      description,
      proposer: user.id,
      timestamp: new Date().toISOString(),
    });

    console.log('Submitting to topic:', dao.topic_id);
    const topicTx = await new TopicMessageSubmitTransaction()
      .setTopicId(dao.topic_id)
      .setMessage(proposalMessage)
      .freezeWith(client);

    const topicSign = await topicTx.sign(operatorKey);
    const topicSubmit = await topicSign.execute(client);
    const topicReceipt = await topicSubmit.getReceipt(client);
    const sequenceNumber = topicReceipt.topicSequenceNumber;

    console.log('Message submitted, sequence:', sequenceNumber);

    // Update proposal with sequence number
    await supabase
      .from('proposals')
      .update({ message_sequence_number: sequenceNumber })
      .eq('id', proposal.id);

    client.close();

    return new Response(
      JSON.stringify({ success: true, proposal }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error submitting proposal:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
