export type ApiUserProfile = {
  id: number;
  nickname: string | null;
  avatarUrl: string | null;
  joinDate: string;
};

export type ApiLoginResult = {
  token: string;
  user: ApiUserProfile;
};
