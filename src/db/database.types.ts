export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string;
          id: number;
          initial_balance: number;
          name: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          initial_balance: number;
          name: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          initial_balance?: number;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      budget: {
        Row: {
          budget_date: string;
          category_id: number;
          created_at: string;
          id: number;
          planned_amount: number;
          user_id: string;
        };
        Insert: {
          budget_date: string;
          category_id: number;
          created_at?: string;
          id?: number;
          planned_amount: number;
          user_id: string;
        };
        Update: {
          budget_date?: string;
          category_id?: number;
          created_at?: string;
          id?: number;
          planned_amount?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "budget_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string;
          id: number;
          is_revenue: boolean;
          name: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          is_revenue?: boolean;
          name: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          is_revenue?: boolean;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          account_id: number;
          amount: number;
          category_id: number | null;
          created_at: string;
          description: string | null;
          id: number;
          related_transaction_id: number | null;
          transaction_date: string;
          transaction_type: Database["public"]["Enums"]["transaction_type_enum"];
          user_id: string;
        };
        Insert: {
          account_id: number;
          amount: number;
          category_id?: number | null;
          created_at?: string;
          description?: string | null;
          id?: number;
          related_transaction_id?: number | null;
          transaction_date: string;
          transaction_type: Database["public"]["Enums"]["transaction_type_enum"];
          user_id: string;
        };
        Update: {
          account_id?: number;
          amount?: number;
          category_id?: number | null;
          created_at?: string;
          description?: string | null;
          id?: number;
          related_transaction_id?: number | null;
          transaction_date?: string;
          transaction_type?: Database["public"]["Enums"]["transaction_type_enum"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_related_transaction";
            columns: ["related_transaction_id"];
            isOneToOne: false;
            referencedRelation: "transactions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_account_id_fkey";
            columns: ["account_id"];
            isOneToOne: false;
            referencedRelation: "accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      create_transfer: {
        Args: {
          p_user_id: string;
          p_source_account_id: number;
          p_destination_account_id: number;
          p_amount: number;
          p_transaction_date: string;
          p_description: string | null;
        };
        Returns: {
          source_transaction: Database["public"]["Tables"]["transactions"]["Row"];
          destination_transaction: Database["public"]["Tables"]["transactions"]["Row"];
        };
      };
    };
    Enums: {
      transaction_type_enum: "expense" | "revenue" | "transfer";
    };
    CompositeTypes: Record<never, never>;
  };
}

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      transaction_type_enum: ["expense", "revenue", "transfer"],
    },
  },
} as const;
