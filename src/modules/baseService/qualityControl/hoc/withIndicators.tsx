export default function withIndicators(Component: any) {
  return (props: any) => {
    const { isLoading, isError, hasDataAfterFetch } = props;
    if (isLoading) return <div>Loading..</div>;
    if (isError) return <div>Something went wrong</div>;
    if (!hasDataAfterFetch) return <div>No data found</div>;
    return <Component {...props} />;
  };
}
