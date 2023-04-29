import { useRouter } from 'next/router'

export default function Strategy() {

    const router = useRouter();
    const {id} = router.query;

    console.log(id);

    return <div>Selected Trading Strategy: {id}</div>
}