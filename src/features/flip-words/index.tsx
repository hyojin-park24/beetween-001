import { words } from './data.ts';
import styles from './FlipWords.module.css';

export default function FlipWords() {
    return(
        <div className={styles.stage}>
            <span className={styles.word}>{words[0]}</span>
        </div>
    )
}