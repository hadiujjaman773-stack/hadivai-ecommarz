export const pushToDataLayer = (eventName: string, data: Record<string, unknown>) => {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    
    // Clear previous e-commerce object
    window.dataLayer.push({ ecommerce: null });
    
    // Extract user_data if it exists so it can be placed at the root
    const { user_data, ...ecommerceData } = data;
    
    const pushObj: any = {
      event: eventName,
      ecommerce: ecommerceData,
    };
    
    // Add user_data to the root if it exists
    if (user_data) {
      pushObj.user_data = user_data;
    }
    
    // Push the new event
    window.dataLayer.push(pushObj);
  }
};
