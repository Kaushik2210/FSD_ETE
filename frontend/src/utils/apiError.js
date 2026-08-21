// Normalises an axios error into the { message, errors } shape produced by
// the backend's errorHandler, so every catch block can treat errors the same
// way regardless of whether the failure was a validation 400 or a network drop.
export const parseApiError = (error) => {
  const body = error?.response?.data;
  if (body?.message) return { message: body.message, errors: body.errors || null };
  if (error?.message === 'Network Error') {
    return { message: 'Cannot reach the server. Is the backend running?', errors: null };
  }
  return { message: 'Something went wrong. Please try again.', errors: null };
};
