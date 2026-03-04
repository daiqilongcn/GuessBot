export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            battles: {
                Row: {
                    created_at: string
                    id: string
                    messages: Json
                    model_a_id: string
                    model_b_id: string
                    status: string
                    topic: string | null
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    messages?: Json
                    model_a_id: string
                    model_b_id: string
                    status?: string
                    topic?: string | null
                    user_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    messages?: Json
                    model_a_id?: string
                    model_b_id?: string
                    status?: string
                    topic?: string | null
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "battles_model_a_id_fkey"
                        columns: ["model_a_id"]
                        isOneToOne: false
                        referencedRelation: "models"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "battles_model_b_id_fkey"
                        columns: ["model_b_id"]
                        isOneToOne: false
                        referencedRelation: "models"
                        referencedColumns: ["id"]
                    },
                ]
            }
            models: {
                Row: {
                    created_at: string
                    display_name: string
                    elo_rating: number
                    id: string
                    is_active: boolean
                    model_id: string
                    provider_id: string
                    total_battles: number
                    total_wins: number
                    updated_at: string
                }
                Insert: {
                    created_at?: string
                    display_name: string
                    elo_rating?: number
                    id?: string
                    is_active?: boolean
                    model_id: string
                    provider_id: string
                    total_battles?: number
                    total_wins?: number
                    updated_at?: string
                }
                Update: {
                    created_at?: string
                    display_name?: string
                    elo_rating?: number
                    id?: string
                    is_active?: boolean
                    model_id?: string
                    provider_id?: string
                    total_battles?: number
                    total_wins?: number
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "models_provider_id_fkey"
                        columns: ["provider_id"]
                        isOneToOne: false
                        referencedRelation: "providers"
                        referencedColumns: ["id"]
                    },
                ]
            }
            profiles: {
                Row: {
                    avatar_url: string | null
                    created_at: string
                    id: string
                    is_admin: boolean
                    total_votes: number
                    username: string | null
                }
                Insert: {
                    avatar_url?: string | null
                    created_at?: string
                    id: string
                    is_admin?: boolean
                    total_votes?: number
                    username?: string | null
                }
                Update: {
                    avatar_url?: string | null
                    created_at?: string
                    id?: string
                    is_admin?: boolean
                    total_votes?: number
                    username?: string | null
                }
                Relationships: []
            }
            providers: {
                Row: {
                    api_format: string
                    api_key: string
                    base_url: string
                    created_at: string
                    id: string
                    is_active: boolean
                    name: string
                    updated_at: string
                }
                Insert: {
                    api_format?: string
                    api_key: string
                    base_url: string
                    created_at?: string
                    id?: string
                    is_active?: boolean
                    name: string
                    updated_at?: string
                }
                Update: {
                    api_format?: string
                    api_key?: string
                    base_url?: string
                    created_at?: string
                    id?: string
                    is_active?: boolean
                    name?: string
                    updated_at?: string
                }
                Relationships: []
            }
            votes: {
                Row: {
                    battle_id: string
                    created_at: string
                    id: string
                    user_id: string
                    winner: string
                }
                Insert: {
                    battle_id: string
                    created_at?: string
                    id?: string
                    user_id: string
                    winner: string
                }
                Update: {
                    battle_id?: string
                    created_at?: string
                    id?: string
                    user_id?: string
                    winner?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "votes_battle_id_fkey"
                        columns: ["battle_id"]
                        isOneToOne: false
                        referencedRelation: "battles"
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

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
