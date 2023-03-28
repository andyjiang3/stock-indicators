import { useRouter } from 'next/router'

export default function Stock() {

    const router = useRouter();
    const {id} = router.query;

    return <div>Selected Stock: {id}</div>
}