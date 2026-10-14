import {useState} from 'react';
import { words } from './data.ts';
import styles from './FlipWords.module.css';

// 3 -> "03"
function pad(value: number){
    return String(value).padStart(2, '0');
}

export default function FlipWords() {
    const [index, setIndex] = useState(0);

    // 방향 하나로 앞뒤를 다 처리, 길이를 더해서 음수를 피해감
    function step(direction: 1 | -1){
        setIndex((current)=>(current + direction + words.length) % words.length);
    }

    return(
        <div className={styles.stage} onClick={()=>step(1)}>
            <span className={styles.word}>{words[0]}</span>
            <p className={styles.counter}>
                <span className={styles.currentIndex}>
                    {pad(index + 1)}
                </span> / {pad(words.length)}
            </p>
        </div>
    )
}