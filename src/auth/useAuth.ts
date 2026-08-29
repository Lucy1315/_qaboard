import { useContext } from 'react';
import { AuthContext } from './AuthProvider';

export function useAuth() {
  const state = useContext(AuthContext);
  const role = state.viewer.role;
  return {
    ...state,
    isLoading: state.status === 'loading',
    isAnon: role === 'anon',
    isMember: role === 'member',
    isAdmin: role === 'admin',
  };
}
