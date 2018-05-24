import math
import random
import pygame
import os
import game
import triangle 
import time

g = game.Game(0, 640, 480)
fig = triangle.Object(50, 50)
end = False
dx = 0
dy = 0
move_right = False
move_left = False
move_up = False
move_down = False

FPS = 30

while 1: 	
	for event in pygame.event.get():
		if event.type == pygame.QUIT:
			pygame.quit()
			end = True
		if event.type == pygame.KEYDOWN:
			if event.key == pygame.K_ESCAPE:
				pygame.quit()
				end = True
			if event.key == pygame.K_DOWN:
				move_down = True
			if event.key == pygame.K_UP:
				move_up = True
			if event.key == pygame.K_LEFT:
				move_left = True
			if event.key == pygame.K_RIGHT:
				move_right = True
		
		if event.type == pygame.KEYUP:
			if event.key == pygame.K_DOWN:
				move_down = False
			if event.key == pygame.K_UP:
				move_up = False
			if event.key == pygame.K_LEFT:
				move_left = False
			if event.key == pygame.K_RIGHT:
				move_right = False

	if move_left:
		if dx > -5:
			dx -= 0.5
	else: 
		if dx < 0:
			dx += 0.5 
	
	if move_right:
		if dx < 5:
			dx += 0.5
	else:
		if dx > 0:
			dx -= 0.5

	if move_up:
		if dy > -5:
			dy -= 0.5
	else:
		if dy < 0:
		   	dy += 0.5

	if move_down:
		if dy < 5:
			dy += 0.5
	else:
   		if dy > 0:
   			dy -= 0.5

	g.background.fill((255, 255, 255))
	g.surface.blit(g.background, (0, 0))
	fig.x += dx
	fig.y += dy
	g.surface.blit(fig.surface, (fig.x, fig.y))
	pygame.display.flip()

	time.sleep(1 / FPS)
	

	if end:
		break
