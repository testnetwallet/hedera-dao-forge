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

    const { proposalId, voteChoice } = await req.json();

    console.log('Casting vote:', { proposalId, voteChoice });

    // Get proposal and DAO
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('*, daos(*)')
      .eq('id', proposalId)
      .single();

    if (proposalError || !proposal) throw new Error('Proposal not found');

    // Check if proposal is still active
    if (proposal.status !== 'active') {
      throw new Error('Proposal is not active');
    }

    if (new Date(proposal.ends_at) < new Date()) {
      throw new Error('Voting period has ended');
    }

    // Get member info
    const { data: member, error: memberError } = await supabase
      .from('dao_members')
      .select('*')
      .eq('dao_id', proposal.dao_id)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) throw new Error('Not a DAO member');

    // Check if already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('proposal_id', proposalId)
      .eq('voter_id', user.id)
      .single();

    if (existingVote) throw new Error('Already voted on this proposal');

    // Initialize Hedera client
    const operatorId = AccountId.fromString(Deno.env.get('HEDERA_OPERATOR_ID')!);
    const operatorKey = PrivateKey.fromStringED25519(Deno.env.get('HEDERA_OPERATOR_KEY')!);
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    // Submit vote to HCS topic
    const voteMessage = JSON.stringify({
      type: 'vote',
      proposalId,
      voter: user.id,
      voteChoice,
      weight: member.token_balance,
      timestamp: new Date().toISOString(),
    });

    console.log('Submitting vote to topic:', proposal.daos.topic_id);
    const topicTx = await new TopicMessageSubmitTransaction()
      .setTopicId(proposal.daos.topic_id)
      .setMessage(voteMessage)
      .freezeWith(client);

    const topicSign = await topicTx.sign(operatorKey);
    const topicSubmit = await topicSign.execute(client);
    const topicReceipt = await topicSubmit.getReceipt(client);

    console.log('Vote submitted to HCS');

    client.close();

    // Store vote in database
    const { data: vote, error: voteError } = await supabase
      .from('votes')
      .insert({
        proposal_id: proposalId,
        voter_id: user.id,
        vote_choice: voteChoice,
        vote_weight: member.token_balance,
        hedera_account_id: member.hedera_account_id,
        transaction_id: topicSubmit.transactionId.toString(),
      })
      .select()
      .single();

    if (voteError) throw voteError;

    // Update proposal vote counts
    const voteWeight = member.token_balance;
    const updateData: any = {
      total_votes: proposal.total_votes + voteWeight,
    };

    if (voteChoice === 'for') {
      updateData.votes_for = proposal.votes_for + voteWeight;
    } else {
      updateData.votes_against = proposal.votes_against + voteWeight;
    }

    await supabase
      .from('proposals')
      .update(updateData)
      .eq('id', proposalId);

    return new Response(
      JSON.stringify({ success: true, vote }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error casting vote:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
