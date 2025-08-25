import React from 'react';
import Comment from './Comment';
import CommentForm from './CommentForm';
import { useComments } from '../../hooks/useComments';

const CommentList = ({ postId }) => {
  const { comments, loading, error, createComment } = useComments(postId);

  const handleAddComment = async (content) => {
    try {
      await createComment({
        post: postId,
        content,
        parentComment: null // For top-level comments
      });
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="comment-section">
      <h3>Comments ({comments.length})</h3>
      <CommentForm onSubmit={handleAddComment} />
      <div className="comments-list">
        {comments.map(comment => (
          <Comment key={comment._id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default CommentList;