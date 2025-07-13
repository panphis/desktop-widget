import {  Window } from '@tauri-apps/api/window';
import {  LogicalPosition } from '@tauri-apps/api/window';
import { debounce } from './debounce';

const EDGE_THRESHOLD = 30;

const appWindow = new Window('main');

const snapToEdges = debounce(async () => {
  const screen = await appWindow.screen();
  const position = await appWindow.outerPosition();
  const size = await appWindow.outerSize();

  let newX = position.x;
  let newY = position.y;

  // 左右贴边
  if (Math.abs(position.x) < EDGE_THRESHOLD) {
    newX = 0;
  } else if (Math.abs(screen.width - (position.x + size.width)) < EDGE_THRESHOLD) {
    newX = screen.width - size.width;
  }

  // 上下贴边
  if (Math.abs(position.y) < EDGE_THRESHOLD) {
    newY = 0;
  } else if (Math.abs(screen.height - (position.y + size.height)) < EDGE_THRESHOLD) {
    newY = screen.height - size.height;
  }

  await appWindow.setPosition(new LogicalPosition(newX, newY));
}, 100);

export const initSnap = () => {
  appWindow.onMoved(() => {
    snapToEdges();
  });
};