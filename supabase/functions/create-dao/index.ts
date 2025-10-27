import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";
import {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TopicCreateTransaction,
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

    const { name, symbol, description, initialSupply, quorumPercentage, votingPeriod } = await req.json();

    console.log('Creating DAO:', { name, symbol, description, initialSupply, quorumPercentage, votingPeriod });

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

    // Create governance token
    console.log('Creating token...');
    const tokenCreateTx = await new TokenCreateTransaction()
      .setTokenName(name)
      .setTokenSymbol(symbol)
      .setTokenType(TokenType.FungibleCommon)
      .setDecimals(0)
      .setInitialSupply(initialSupply)
      .setTreasuryAccountId(operatorId)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(initialSupply * 10)
      .setSupplyKey(operatorKey)
      .setAdminKey(operatorKey)
      .freezeWith(client);

    const tokenCreateSign = await tokenCreateTx.sign(operatorKey);
    const tokenCreateSubmit = await tokenCreateSign.execute(client);
    const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);
    const tokenId = tokenCreateReceipt.tokenId!.toString();

    console.log('Token created:', tokenId);

    // Create consensus topic
    console.log('Creating topic...');
    const topicCreateTx = await new TopicCreateTransaction()
      .setTopicMemo(`DAO: ${name} - ${symbol}`)
      .setAdminKey(operatorKey)
      .freezeWith(client);

    const topicCreateSign = await topicCreateTx.sign(operatorKey);
    const topicCreateSubmit = await topicCreateSign.execute(client);
    const topicCreateReceipt = await topicCreateSubmit.getReceipt(client);
    const topicId = topicCreateReceipt.topicId!.toString();

    console.log('Topic created:', topicId);

    client.close();

    // Store DAO in database
    const { data: dao, error: daoError } = await supabase
      .from('daos')
      .insert({
        name,
        symbol,
        description,
        initial_supply: initialSupply,
        quorum_percentage: quorumPercentage,
        voting_period_days: votingPeriod,
        creator_id: user.id,
        token_id: tokenId,
        topic_id: topicId,
      })
      .select()
      .single();

    if (daoError) throw daoError;

    // Add creator as first member
    await supabase
      .from('dao_members')
      .insert({
        dao_id: dao.id,
        user_id: user.id,
        hedera_account_id: operatorId.toString(),
        token_balance: initialSupply,
      });

    console.log('DAO created successfully:', dao);

    return new Response(
      JSON.stringify({ success: true, dao }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating DAO:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
