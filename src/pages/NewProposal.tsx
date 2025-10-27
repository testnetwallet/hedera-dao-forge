import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const NewProposal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [daos, setDaos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    daoId: "",
    title: "",
    description: "",
  });

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a proposal",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    fetchDaos();
  }, [user, navigate, toast]);

  const fetchDaos = async () => {
    try {
      const { data, error } = await supabase
        .from('daos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDaos(data || []);
    } catch (error: any) {
      console.error('Error fetching DAOs:', error);
      toast({
        title: "Error",
        description: "Failed to load DAOs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to create a proposal",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      const response = await supabase.functions.invoke('submit-proposal', {
        body: formData,
      });

      if (response.error) throw response.error;

      toast({
        title: "Proposal Submitted!",
        description: "Your proposal is now active for voting",
      });
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Error submitting proposal:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit proposal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">
              Create New <span className="gradient-text">Proposal</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Submit your idea for community voting
            </p>
          </div>

          <Card className="glass-card border-border/30">
            <CardHeader>
              <CardTitle>Proposal Details</CardTitle>
              <CardDescription>
                Provide information about your proposal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="daoId">Select DAO</Label>
                  <Select
                    value={formData.daoId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, daoId: value }))}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? "Loading DAOs..." : "Choose a DAO"} />
                    </SelectTrigger>
                    <SelectContent>
                      {daos.map((dao) => (
                        <SelectItem key={dao.id} value={dao.id}>
                          {dao.name} ({dao.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Proposal Title</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Allocate funds for marketing campaign"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Provide details about your proposal..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    className="flex-1"
                    disabled={isSubmitting || !formData.daoId}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Proposal"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => navigate("/dashboard")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewProposal;
