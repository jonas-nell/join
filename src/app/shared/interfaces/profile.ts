export interface Profile {
    id: string;
    created_at: string;
    user_name: string;
    user_email: string;

    // The phone number can be empty.
    user_phone: string | null;

    // Examples: user, admin, guest or dummy.
    user_role: string;

    // Real users have an Auth ID.
    // Dummy contacts have no Auth ID.
    auth_user_id: string | null;
}

// These are the fields that the edit form may change.
export interface ProfileChanges {
    user_name: string;
    user_email: string;
    user_phone: string | null;
}