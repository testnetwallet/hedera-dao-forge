import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, TrendingUp, Users, Vote, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const mockProposals = [
  {
    id: 1,
    title: "Allocate 10,000 HBAR for Marketing Campaign",
    description: "Fund a comprehensive marketing initiative to grow community",
    status: "active",
    votesFor: 7500,
    votesAgainst: 2500,
    totalVotes: 10000,
    quorum: 5000,
    endsIn: "3 days",
  },
  {
    id: 2,
    title: "Upgrade Smart Contract Treasury",
    description: "Deploy new treasury contract with multi-sig support",
    status: "active",
    votesFor: 4200,
    votesAgainst: 1800,
    totalVotes: 6000,
    quorum: 5000,
    endsIn: "5 days",
  },
  {
    id: 3,
    title: "Partnership with DeFi Protocol",
    description: "Establish strategic partnership for liquidity provision",
    status: "passed",
    votesFor: 8500,
    votesAgainst: 1500,
    totalVotes: 10000,
    quorum: 5000,
    endsIn: "Ended",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access the dashboard",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    fetchProposals();
  }, [user, navigate, toast]);

  const fetchProposals = async () => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select('*, daos(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (error: any) {
      console.error('Error fetching proposals:', error);
      toast({
        title: "Error",
        description: "Failed to load proposals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (proposalId: string) => {
    try {
      const { error } = await supabase.functions.invoke('cast-vote', {
        body: { proposalId, voteChoice: 'for' },
      });

      if (error) throw error;

      toast({
        title: "Vote Cast!",
        description: "Your vote has been recorded on Hedera",
      });

      fetchProposals();
    } catch (error: any) {
      console.error('Error casting vote:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to cast vote",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: any }> = {
      active: { variant: "default", icon: Clock },
      passed: { variant: "secondary", icon: CheckCircle2 },
      rejected: { variant: "destructive", icon: XCircle },
    };
    
    const { variant, icon: Icon } = variants[status] || variants.active;
    
    return (
      <Badge variant={variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              DAO <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">Manage proposals and track governance activity</p>
          </div>
          <Button variant="hero" size="lg" onClick={() => navigate("/proposal/new")}>
            <Plus className="w-5 h-5" />
            New Proposal
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Users, label: "Total Members", value: "1,234", change: "+12%" },
            { icon: Vote, label: "Active Proposals", value: "8", change: "+2" },
            { icon: TrendingUp, label: "Participation Rate", value: "67%", change: "+5%" },
            { icon: CheckCircle2, label: "Passed Proposals", value: "45", change: "+3" },
          ].map((stat, idx) => (
            <Card key={idx} className="glass-card border-border/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5 text-primary" />
                  <span className="text-sm text-accent font-medium">{stat.change}</span>
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Proposals List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Active Proposals</h2>
          
          {loading ? (
            <Card className="glass-card border-border/30">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Loading proposals...</p>
              </CardContent>
            </Card>
          ) : proposals.length === 0 ? (
            <Card className="glass-card border-border/30">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">No proposals yet. Create one to get started!</p>
              </CardContent>
            </Card>
          ) : (
            proposals.map((proposal) => (
            <Card key={proposal.id} className="glass-card border-border/30 hover:shadow-card transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{proposal.title}</CardTitle>
                      {getStatusBadge(proposal.status)}
                    </div>
                    <CardDescription>{proposal.description}</CardDescription>
                  </div>
                  {proposal.status === "active" && (
                    <Button variant="hero" size="sm" onClick={() => handleVote(proposal.id)}>
                      Vote Now
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {proposal.total_votes.toLocaleString()} / {proposal.quorum_required.toLocaleString()} votes
                    </span>
                  </div>
                  <Progress value={(proposal.total_votes / proposal.quorum_required) * 100} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">For</div>
                    <div className="text-lg font-bold text-accent">
                      {proposal.total_votes > 0 
                        ? ((proposal.votes_for / proposal.total_votes) * 100).toFixed(1)
                        : 0}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Against</div>
                    <div className="text-lg font-bold text-destructive">
                      {proposal.total_votes > 0
                        ? ((proposal.votes_against / proposal.total_votes) * 100).toFixed(1)
                        : 0}%
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Ends At</div>
                    <div className="text-lg font-bold">
                      {new Date(proposal.ends_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
