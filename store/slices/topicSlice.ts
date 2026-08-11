import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiInstance from '../../services/apiInstance';

export interface Topic {
  id?: string;
  tmdbId: number;
  title: string;
  poster?: string;
  backdrop?: string;
  overview?: string;
  releaseYear?: string;
  memberCount?: number;
  lastMessage?: string;
  lastMessageAt?: string;
  isJoined?: boolean;
  unreadCount?: number;
  unreadGeneral?: number;
  unreadActing?: number;
  unreadCinematography?: number;
  unreadPlot?: number;
  unreadMusic?: number;
  unreadVfx?: number;
}

export interface ChatMessage {
  id: string;
  topicId: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  messageType: 'TEXT' | 'IMAGE' | 'SYSTEM';
  subTopic?: string;
  isSpoiler?: boolean;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    name?: string;
    profilePic?: string;
  };
  replyToId?: string;
  replyToUser?: string;
  replyToContent?: string;
}

interface TopicState {
  myTopics: Topic[];
  exploreTopicsList: Topic[];
  backendDiscussions: Topic[];
  searchResults: Topic[];
  activeMessages: ChatMessage[];
  activeTopic: Topic | null;
  activeSubTopic: string;
  isLoading: boolean;
  isMessagesLoading: boolean;
  error: string | null;
}

const initialState: TopicState = {
  myTopics: [],
  exploreTopicsList: [],
  backendDiscussions: [],
  searchResults: [],
  activeMessages: [],
  activeTopic: null,
  activeSubTopic: 'general',
  isLoading: false,
  isMessagesLoading: false,
  error: null,
};

export const fetchBackendDiscussionsThunk = createAsyncThunk(
  'topic/fetchBackendDiscussions',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await apiInstance.get('/topics/explore', { params: { page } });
      return { topics: response.data.topics || [], page };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch backend discussions');
    }
  }
);

export const fetchMyTopicsThunk = createAsyncThunk('topic/fetchMyTopics', async (_, { rejectWithValue }) => {
  try {
    const response = await apiInstance.get('/topics/my-topics');
    return response.data.topics;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch topics');
  }
});

export const exploreTopicsThunk = createAsyncThunk(
  'topic/exploreTopics',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await apiInstance.get('/movies/trending', { params: { page } });
      const results = response.data.results || [];
      const topics = results.map((m: any) => ({
        tmdbId: m.id,
        title: m.title || m.name,
        poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : undefined,
        backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : undefined,
        overview: m.overview,
        releaseYear: m.release_date ? m.release_date.split('-')[0] : '',
      }));
      return { topics, page };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch trending movies');
    }
  }
);

export const searchMoviesThunk = createAsyncThunk(
  'topic/searchMovies',
  async ({ query, page = 1 }: { query: string; page?: number }, { rejectWithValue }) => {
    try {
      const response = await apiInstance.get('/movies/search', { params: { query, page } });
      const results = response.data.results || [];
      const topics = results.map((m: any) => ({
        tmdbId: m.id,
        title: m.title || m.name,
        poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : undefined,
        backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : undefined,
        overview: m.overview,
        releaseYear: m.release_date ? m.release_date.split('-')[0] : '',
      }));
      return { topics, page };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Movie search failed');
    }
  }
);

export const joinTopicThunk = createAsyncThunk(
  'topic/joinTopic',
  async (topicData: Topic, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiInstance.post('/topics/join', topicData);
      dispatch(fetchMyTopicsThunk());
      return response.data.topic;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to join topic');
    }
  }
);

export const leaveTopicThunk = createAsyncThunk(
  'topic/leaveTopic',
  async (tmdbId: number, { dispatch, rejectWithValue }) => {
    try {
      const response = await apiInstance.delete(`/topics/${tmdbId}/leave`);
      dispatch(fetchMyTopicsThunk());
      return response.data.tmdbId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to leave topic');
    }
  }
);

export const fetchTopicMessagesThunk = createAsyncThunk(
  'topic/fetchMessages',
  async (
    { tmdbId, subTopic = 'general', isSpoiler = false }: { tmdbId: number; subTopic?: string; isSpoiler?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiInstance.get(`/topics/${tmdbId}/messages`, {
        params: { subTopic, isSpoiler },
      });
      return { messages: response.data.messages, topic: response.data.topic };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load messages');
    }
  }
);

const topicSlice = createSlice({
  name: 'topic',
  initialState,
  reducers: {
    addRealtimeMessage: (state, action: PayloadAction<ChatMessage>) => {
      // Append if not already existing
      if (!state.activeMessages.some((m) => m.id === action.payload.id)) {
        state.activeMessages.push(action.payload);
      }
    },
    setActiveTopic: (state, action: PayloadAction<Topic | null>) => {
      state.activeTopic = action.payload;
      if (action.payload) {
        const topicIndex = state.myTopics.findIndex((t) => t.tmdbId === action.payload!.tmdbId);
        if (topicIndex !== -1) {
          state.myTopics[topicIndex].unreadCount = 0;
        }
      }
    },
    setActiveSubTopic: (state, action: PayloadAction<string>) => {
      state.activeSubTopic = action.payload;
    },
    updateTopicLastMessage: (
      state,
      action: PayloadAction<{
        tmdbId: number;
        lastMessage: string;
        lastMessageAt: string;
        senderId: string;
        currentUserId: string;
        isActiveTopic: boolean;
        subTopic?: string;
        activeSubTopic?: string;
      }>
    ) => {
      const { tmdbId, lastMessage, lastMessageAt, senderId, currentUserId, isActiveTopic, subTopic, activeSubTopic } = action.payload;
      const topicIndex = state.myTopics.findIndex((t) => t.tmdbId === tmdbId);
      if (topicIndex !== -1) {
        state.myTopics[topicIndex].lastMessage = lastMessage;
        state.myTopics[topicIndex].lastMessageAt = lastMessageAt;

        if (senderId !== currentUserId) {
          const cleanSubTopic = subTopic || 'general';
          const isUserViewingThisMessageContext = isActiveTopic && activeSubTopic === cleanSubTopic;

          if (!isUserViewingThisMessageContext) {
            state.myTopics[topicIndex].unreadCount = (state.myTopics[topicIndex].unreadCount || 0) + 1;

            if (cleanSubTopic === 'general') state.myTopics[topicIndex].unreadGeneral = (state.myTopics[topicIndex].unreadGeneral || 0) + 1;
            else if (cleanSubTopic === 'acting') state.myTopics[topicIndex].unreadActing = (state.myTopics[topicIndex].unreadActing || 0) + 1;
            else if (cleanSubTopic === 'cinematography') state.myTopics[topicIndex].unreadCinematography = (state.myTopics[topicIndex].unreadCinematography || 0) + 1;
            else if (cleanSubTopic === 'plot') state.myTopics[topicIndex].unreadPlot = (state.myTopics[topicIndex].unreadPlot || 0) + 1;
            else if (cleanSubTopic === 'music') state.myTopics[topicIndex].unreadMusic = (state.myTopics[topicIndex].unreadMusic || 0) + 1;
            else if (cleanSubTopic === 'vfx') state.myTopics[topicIndex].unreadVfx = (state.myTopics[topicIndex].unreadVfx || 0) + 1;
          }
        }

        // Re-sort the topics: latest lastMessageAt at the top
        state.myTopics.sort((a, b) => {
          const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return timeB - timeA;
        });
      }
    },
    markSubTopicAsRead: (
      state,
      action: PayloadAction<{
        tmdbId: number;
        subTopic: string;
      }>
    ) => {
      const { tmdbId, subTopic } = action.payload;
      const topicIndex = state.myTopics.findIndex((t) => t.tmdbId === tmdbId);
      if (topicIndex !== -1) {
        let decrementCount = 0;
        const cleanSubTopic = subTopic || 'general';

        if (cleanSubTopic === 'general') {
          decrementCount = state.myTopics[topicIndex].unreadGeneral || 0;
          state.myTopics[topicIndex].unreadGeneral = 0;
        } else if (cleanSubTopic === 'acting') {
          decrementCount = state.myTopics[topicIndex].unreadActing || 0;
          state.myTopics[topicIndex].unreadActing = 0;
        } else if (cleanSubTopic === 'cinematography') {
          decrementCount = state.myTopics[topicIndex].unreadCinematography || 0;
          state.myTopics[topicIndex].unreadCinematography = 0;
        } else if (cleanSubTopic === 'plot') {
          decrementCount = state.myTopics[topicIndex].unreadPlot || 0;
          state.myTopics[topicIndex].unreadPlot = 0;
        } else if (cleanSubTopic === 'music') {
          decrementCount = state.myTopics[topicIndex].unreadMusic || 0;
          state.myTopics[topicIndex].unreadMusic = 0;
        } else if (cleanSubTopic === 'vfx') {
          decrementCount = state.myTopics[topicIndex].unreadVfx || 0;
          state.myTopics[topicIndex].unreadVfx = 0;
        }

        state.myTopics[topicIndex].unreadCount = Math.max(0, (state.myTopics[topicIndex].unreadCount || 0) - decrementCount);
      }
    },
    clearActiveTopic: (state) => {
      state.activeTopic = null;
      state.activeMessages = [];
      state.activeSubTopic = 'general';
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // My Topics
      .addCase(fetchMyTopicsThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMyTopicsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myTopics = action.payload;
      })
      .addCase(fetchMyTopicsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Explore Topics
      .addCase(exploreTopicsThunk.fulfilled, (state, action) => {
        if (action.payload.page === 1) {
          state.exploreTopicsList = action.payload.topics;
        } else {
          const existingIds = new Set(state.exploreTopicsList.map((t) => t.tmdbId));
          const newTopics = action.payload.topics.filter((t: Topic) => !existingIds.has(t.tmdbId));
          state.exploreTopicsList.push(...newTopics);
        }
      })
      // Backend Discussions
      .addCase(fetchBackendDiscussionsThunk.fulfilled, (state, action) => {
        if (action.payload.page === 1) {
          state.backendDiscussions = action.payload.topics;
        } else {
          const existingIds = new Set(state.backendDiscussions.map((t) => t.id || t.tmdbId));
          const newTopics = action.payload.topics.filter((t: Topic) => !existingIds.has(t.id || t.tmdbId));
          state.backendDiscussions.push(...newTopics);
        }
      })
      // Search Movies
      .addCase(searchMoviesThunk.fulfilled, (state, action) => {
        if (action.payload.page === 1) {
          state.searchResults = action.payload.topics;
        } else {
          const existingIds = new Set(state.searchResults.map((t) => t.tmdbId));
          const newTopics = action.payload.topics.filter((t: Topic) => !existingIds.has(t.tmdbId));
          state.searchResults.push(...newTopics);
        }
      })
      // Fetch Messages
      .addCase(fetchTopicMessagesThunk.pending, (state) => {
        state.isMessagesLoading = true;
        state.activeMessages = [];
        state.activeTopic = null;
      })
      .addCase(fetchTopicMessagesThunk.fulfilled, (state, action) => {
        state.isMessagesLoading = false;
        state.activeMessages = action.payload.messages;
        if (action.payload.topic) {
          state.activeTopic = action.payload.topic;
        }
      })
      .addCase(fetchTopicMessagesThunk.rejected, (state) => {
        state.isMessagesLoading = false;
      });
  },
});

export const { addRealtimeMessage, setActiveTopic, setActiveSubTopic, updateTopicLastMessage, clearSearchResults, clearActiveTopic, markSubTopicAsRead } = topicSlice.actions;
export default topicSlice.reducer;
