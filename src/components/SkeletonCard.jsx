export function SkeletonCard() {
  return (
    <div
      className="card"
      style={{
        overflow: "hidden",
        display: "flex",
        gap: "1rem",
        padding: "1rem",
      }}
    >
      <div
        className="skeleton"
        style={{
          width: "110px",
          height: "110px",
          borderRadius: "0.75rem",
          flexShrink: 0,
        }}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          paddingTop: "0.25rem",
        }}
      >
        <div className="skeleton" style={{ height: "18px", width: "70%" }} />
        <div className="skeleton" style={{ height: "13px", width: "90%" }} />
        <div className="skeleton" style={{ height: "13px", width: "55%" }} />
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div className="skeleton" style={{ height: "20px", width: "80px" }} />
          <div
            className="skeleton"
            style={{ height: "34px", width: "34px", borderRadius: "50%" }}
          />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 4 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
