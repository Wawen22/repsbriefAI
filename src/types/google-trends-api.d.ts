declare module 'google-trends-api' {
  const googleTrends: {
    relatedQueries(input: {
      keyword: string
      geo?: string
      startTime?: Date
      endTime?: Date
    }): Promise<string>
  }

  export default googleTrends
}
