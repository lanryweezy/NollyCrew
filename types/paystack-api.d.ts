// declare ambient module for paystack-api
declare module 'paystack-api' {
  const create: (secretKey?: string | undefined) => any;
  export default create;
}
