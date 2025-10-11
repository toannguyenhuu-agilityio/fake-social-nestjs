export type CommentResponseType = {
  body: {
    id: string;
    content: string;
    authorId: string;
    postId: string;
  };
  headers: Record<string, string>;
};
