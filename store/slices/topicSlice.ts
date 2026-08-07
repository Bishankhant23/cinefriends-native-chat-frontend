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
}

interface TopicState {
  myTopics: Topic[];
  exploreTopicsList: Topic[];
  backendDiscussions: Topic[];
  searchResults: Topic[];
  activeMessages: ChatMessage[];
  activeTopic: Topic | null;
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
    },
    clearActiveTopic: (state) => {
      state.activeTopic = null;
      state.activeMessages = [];
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

export const { addRealtimeMessage, setActiveTopic, clearSearchResults, clearActiveTopic } = topicSlice.actions;
export default topicSlice.reducer;
