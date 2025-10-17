-- Create DAOs table
CREATE TABLE public.daos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  description TEXT NOT NULL,
  token_id TEXT UNIQUE,
  topic_id TEXT UNIQUE,
  contract_id TEXT,
  initial_supply BIGINT NOT NULL,
  quorum_percentage INTEGER NOT NULL CHECK (quorum_percentage > 0 AND quorum_percentage <= 100),
  voting_period_days INTEGER NOT NULL CHECK (voting_period_days > 0),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create proposals table
CREATE TABLE public.proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dao_id UUID NOT NULL REFERENCES public.daos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'passed', 'rejected', 'executed')),
  votes_for BIGINT DEFAULT 0,
  votes_against BIGINT DEFAULT 0,
  total_votes BIGINT DEFAULT 0,
  quorum_required BIGINT NOT NULL,
  message_sequence_number BIGINT,
  ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_choice TEXT NOT NULL CHECK (vote_choice IN ('for', 'against')),
  vote_weight BIGINT NOT NULL,
  hedera_account_id TEXT NOT NULL,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(proposal_id, voter_id)
);

-- Create members table to track DAO membership and token holdings
CREATE TABLE public.dao_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dao_id UUID NOT NULL REFERENCES public.daos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hedera_account_id TEXT NOT NULL,
  token_balance BIGINT DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(dao_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.daos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dao_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for DAOs
CREATE POLICY "DAOs are viewable by everyone"
  ON public.daos FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create DAOs"
  ON public.daos FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "DAO creators can update their DAOs"
  ON public.daos FOR UPDATE
  USING (auth.uid() = creator_id);

-- RLS Policies for Proposals
CREATE POLICY "Proposals are viewable by everyone"
  ON public.proposals FOR SELECT
  USING (true);

CREATE POLICY "DAO members can create proposals"
  ON public.proposals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dao_members
      WHERE dao_members.dao_id = proposals.dao_id
      AND dao_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Proposal creators can update their proposals"
  ON public.proposals FOR UPDATE
  USING (auth.uid() = proposer_id);

-- RLS Policies for Votes
CREATE POLICY "Votes are viewable by everyone"
  ON public.votes FOR SELECT
  USING (true);

CREATE POLICY "DAO members can vote"
  ON public.votes FOR INSERT
  WITH CHECK (
    auth.uid() = voter_id AND
    EXISTS (
      SELECT 1 FROM public.dao_members
      JOIN public.proposals ON proposals.dao_id = dao_members.dao_id
      WHERE dao_members.user_id = auth.uid()
      AND proposals.id = votes.proposal_id
    )
  );

-- RLS Policies for DAO Members
CREATE POLICY "DAO members are viewable by everyone"
  ON public.dao_members FOR SELECT
  USING (true);

CREATE POLICY "Users can join DAOs"
  ON public.dao_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their membership"
  ON public.dao_members FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_proposals_dao_id ON public.proposals(dao_id);
CREATE INDEX idx_proposals_status ON public.proposals(status);
CREATE INDEX idx_votes_proposal_id ON public.votes(proposal_id);
CREATE INDEX idx_dao_members_dao_id ON public.dao_members(dao_id);
CREATE INDEX idx_dao_members_user_id ON public.dao_members(user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_daos_updated_at
  BEFORE UPDATE ON public.daos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at
  BEFORE UPDATE ON public.proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dao_members_updated_at
  BEFORE UPDATE ON public.dao_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();