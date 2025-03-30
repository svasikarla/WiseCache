declare module 'newspaper' {
  interface Article {
    title: string;
    text: string;
  }

  function newspaper(
    url: string,
    callback: (error: Error | null, article: Article) => void
  ): void;

  export = newspaper;
} 