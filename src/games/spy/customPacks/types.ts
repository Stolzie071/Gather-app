export type CustomSpyWord = {
  id: string;
  name: string;
};

export type CustomSpyPack = {
  id: string;
  name: string;
  words: readonly CustomSpyWord[];
  createdAt: string;
  updatedAt: string;
};

export type CustomSpyPackInput = {
  name: string;
  words: readonly string[];
};
