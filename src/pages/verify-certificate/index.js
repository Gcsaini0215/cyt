// /verify-certificate: the same page with only the code box
export { default } from "./[code]";

export const getServerSideProps = () => ({ props: { code: "", data: null } });
