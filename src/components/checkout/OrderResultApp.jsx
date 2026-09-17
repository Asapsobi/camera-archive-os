export default function OrderResultApp({ orderCode, success }) {
  return (
    <div className="app__scroll" style={{ padding: 24, fontFamily: "var(--font-mono)", fontSize: 13 }}>
      {success ? (
        <>
          <div className="glow-text" style={{ color: "var(--lime-dim)", fontSize: 16, marginBottom: 8 }}>
            SYSTEM: PAYMENT CONFIRMED
          </div>
          <div>ORDER: {orderCode}</div>
          <div style={{ marginTop: 10, opacity: 0.75 }}>
            Payment went through. A confirmation would normally be emailed to you — hang on to your order number.
          </div>
        </>
      ) : (
        <>
          <div style={{ color: "var(--danger-red)", fontSize: 16, marginBottom: 8 }}>SYSTEM: PAYMENT FAILED</div>
          <div>ORDER: {orderCode}</div>
          <div style={{ marginTop: 10, opacity: 0.75 }}>
            The payment didn't go through — nothing was charged. Your cart is still intact, feel free to try
            checkout again.
          </div>
        </>
      )}
    </div>
  );
}
