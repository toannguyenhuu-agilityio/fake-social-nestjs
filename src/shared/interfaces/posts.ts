export type PostResponseType = {
  body: {
    id: string;
    title: string;
    content: string;
    authorId: string;
  };
  headers: Record<string, string>;
};

export type PostListReponseType = {
  body: {
    data: {
      id: string;
      title: string;
      content: string;
      authorId: string;
      createdAt: Date;
      updatedAt: Date;
    };
    meta: {
      currentPage: number;
      itemsPerPage: number;
      totalItems: number;
      totalPages: number;
      lastPage: number;
      nextPage: number;
    };
  };
  headers: Record<string, string>;
};
