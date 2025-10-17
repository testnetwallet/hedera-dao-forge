export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      dao_members: {
        Row: {
          dao_id: string
          hedera_account_id: string
          id: string
          joined_at: string | null
          token_balance: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          dao_id: string
          hedera_account_id: string
          id?: string
          joined_at?: string | null
          token_balance?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          dao_id?: string
          hedera_account_id?: string
          id?: string
          joined_at?: string | null
          token_balance?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dao_members_dao_id_fkey"
            columns: ["dao_id"]
            isOneToOne: false
            referencedRelation: "daos"
            referencedColumns: ["id"]
          },
        ]
      }
      daos: {
        Row: {
          contract_id: string | null
          created_at: string | null
          creator_id: string | null
          description: string
          id: string
          initial_supply: number
          name: string
          quorum_percentage: number
          symbol: string
          token_id: string | null
          topic_id: string | null
          updated_at: string | null
          voting_period_days: number
        }
        Insert: {
          contract_id?: string | null
          created_at?: string | null
          creator_id?: string | null
          description: string
          id?: string
          initial_supply: number
          name: string
          quorum_percentage: number
          symbol: string
          token_id?: string | null
          topic_id?: string | null
          updated_at?: string | null
          voting_period_days: number
        }
        Update: {
          contract_id?: string | null
          created_at?: string | null
          creator_id?: string | null
          description?: string
          id?: string
          initial_supply?: number
          name?: string
          quorum_percentage?: number
          symbol?: string
          token_id?: string | null
          topic_id?: string | null
          updated_at?: string | null
          voting_period_days?: number
        }
        Relationships: []
      }
      proposals: {
        Row: {
          created_at: string | null
          dao_id: string
          description: string
          ends_at: string
          id: string
          message_sequence_number: number | null
          proposer_id: string | null
          quorum_required: number
          status: string
          title: string
          total_votes: number | null
          updated_at: string | null
          votes_against: number | null
          votes_for: number | null
        }
        Insert: {
          created_at?: string | null
          dao_id: string
          description: string
          ends_at: string
          id?: string
          message_sequence_number?: number | null
          proposer_id?: string | null
          quorum_required: number
          status?: string
          title: string
          total_votes?: number | null
          updated_at?: string | null
          votes_against?: number | null
          votes_for?: number | null
        }
        Update: {
          created_at?: string | null
          dao_id?: string
          description?: string
          ends_at?: string
          id?: string
          message_sequence_number?: number | null
          proposer_id?: string | null
          quorum_required?: number
          status?: string
          title?: string
          total_votes?: number | null
          updated_at?: string | null
          votes_against?: number | null
          votes_for?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_dao_id_fkey"
            columns: ["dao_id"]
            isOneToOne: false
            referencedRelation: "daos"
            referencedColumns: ["id"]
          },
        ]
      }
      votes: {
        Row: {
          created_at: string | null
          hedera_account_id: string
          id: string
          proposal_id: string
          transaction_id: string | null
          vote_choice: string
          vote_weight: number
          voter_id: string
        }
        Insert: {
          created_at?: string | null
          hedera_account_id: string
          id?: string
          proposal_id: string
          transaction_id?: string | null
          vote_choice: string
          vote_weight: number
          voter_id: string
        }
        Update: {
          created_at?: string | null
          hedera_account_id?: string
          id?: string
          proposal_id?: string
          transaction_id?: string | null
          vote_choice?: string
          vote_weight?: number
          voter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
