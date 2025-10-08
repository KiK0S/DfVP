import './styles.css';
import { DfvpGame } from './app';

const root = document.getElementById('app');

if (!root) {
  throw new Error('Missing app root element');
}

new DfvpGame(root);
