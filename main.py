import math
import random
import pygame
import os
import game
import player 
import time
import bullet
import enemy

g = game.Game(640, 480)
fig = player.Object(50, 100, 100)
dx = 0
dy = 0
move_right = False
move_left = False
move_up = False
move_down = False

FPS = 30
bullets = []
enemies = []
while 1: 	
	for event in pygame.event.get():
		if event.type == pygame.QUIT:
			pygame.quit()
			end = True
		if event.type == pygame.KEYDOWN:
			if event.key == pygame.K_ESCAPE:
				pygame.quit()
				exit()
			if event.key == pygame.K_DOWN:
				move_down = True
			if event.key == pygame.K_UP:
				move_up = True
			if event.key == pygame.K_LEFT:
				move_left = True
			if event.key == pygame.K_RIGHT:
				move_right = True
			if event.key == pygame.K_SPACE:
				if dx == 0 and dy == 0:
					pass
				else:
					_new = bullet.Object(10, fig.x + fig.center[0], fig.y + fig.center[1], math.atan2(dy, dx))
					bullets.append(_new)
			if event.key == pygame.K_1:
				_new = enemy.Object(random.randint(0, g.width), random.randint(0, g.height), 40)
				enemies.append(_new)   
				                    
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
	if dx == 0 and dy == 0:
		pass
	else:
		fig.rotate(math.atan2(dy, dx) - math.pi / 2)
	
	g.background.fill((255, 255, 255))
	g.surface.blit(g.background, (0, 0))	
	iter = 0
	while iter < len(enemies):
		ok = True
		for b in bullets:
			if math.hypot(b.center[0] - enemies[iter].center[0], b.center[1] - enemies[iter].center[1]) <= b.size + enemies[iter].size:
				del enemies[iter]
				iter -= 1
				ok = False
				break
		if ok:
			g.surface.blit(enemies[iter].surface, (enemies[iter].x, enemies[iter].y))
		iter += 1
	
	fig.x += dx
	fig.y += dy
	g.surface.blit(fig.surface, (fig.x, fig.y))
	iter = 0
	while iter < len(bullets):
		if bullets[iter].x < 0 or bullets[iter].y < 0 or bullets[iter].x >= g.width or bullets[iter].y >= g.width:
			del bullets[iter]
			iter -= 1
		else:
			bullets[iter].x += bullets[iter].dx
			bullets[iter].y += bullets[iter].dy
			bullets[iter].center[0] += bullets[iter].dx
			bullets[iter].center[1] += bullets[iter].dy
			g.surface.blit(bullets[iter].surface, (bullets[iter].x, bullets[iter].y))
		iter += 1
			


	pygame.display.flip()

	time.sleep(1 / FPS)
