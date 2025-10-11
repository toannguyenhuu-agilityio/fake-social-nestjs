export type UserResponseType = {
  body: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  headers: Record<string, string>;
};

export type ListUserResponseType = {
  body: {
    data: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
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
};
