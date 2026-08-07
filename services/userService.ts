import apiInstance from './apiInstance';

export interface UserItemData {
  id: string;
  email: string;
  username: string;
  name: string;
  profilePic?: string;
}

export const userService = {
  searchUsers: async (query: string): Promise<{ items: UserItemData[] }> => {
    try {
      const res = await apiInstance.get('/auth/users/search', { params: { query } });
      return res.data;
    } catch (error) {
      return { items: [] };
    }
  },
};

export default userService;
