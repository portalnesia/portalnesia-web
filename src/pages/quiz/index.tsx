import wrapper from "@redux/store";
import { portalUrl } from "@utils/main";

export const getServerSideProps = wrapper(async({redirect})=>{
    return redirect(portalUrl(`/dashboard/quiz`));
})

export default function QuizIndexTodo() {
    return null;
}