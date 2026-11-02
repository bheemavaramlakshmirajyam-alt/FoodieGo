

const calculateOrderTotal = (items) => {
  let subtotal = 0;

  const calculatedItems = items.map((item) => {
    const lineTotal = item.unitPrice * item.quantity;

    subtotal += lineTotal;

    return {
      ...item,
      lineTotal
    };
  });

  return {
    items: calculatedItems,
    subtotal,
    total: subtotal
  };
};

module.exports = calculateOrderTotal;
