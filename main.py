import math
import random
import pygame
import os
import game
import player 
import time
import bullet
import enemy
import tower        
g = game.Game(600, 600)
tw = tower.Object(g, 'C:\\Users\\KiKoS\\Desktop\\DfVP\\tower.png')
fig = player.Object(0, 0, 50, 'C:\\Users\\KiKoS\\Desktop\\DfVP\\player.png')
dx = 0
dy = 0
move_right = False
move_left = False
move_up = False
move_down = False

score = 0
FPS = 30
bullets = []
enemies = []
current_rate = 0
while 1:	
	current_rate += 1
	if current_rate % FPS == 0:
		dist = g.width * 2
		dist_x = random.randint(-dist, dist)
		minus = 1
		if random.randint(0, 1) == 1:
			minus = -1
		_new = enemy.Object(dist_x, minus * math.sqrt(dist * dist - dist_x * dist_x), 40, tw)
		enemies.append(_new) 
	for event in pygame.event.get():
		if event.type == pygame.QUIT:
			pygame.quit()
			exit()
		if event.type == pygame.KEYDOWN:
			if event.key == pygame.K_ESCAPE:
				print('Goodbye')
				pygame.quit()
				exit()
			if event.key == pygame.K_l:
				if dx == 0 and dy == 0:
					pass
				else:
					_new = bullet.Object(10, fig.x + fig.center[0], fig.y + fig.center[1], math.atan2(dy, dx))
					bullets.append(_new)
			if event.key == pygame.K_s:
				move_down = True
			if event.key == pygame.K_w:
				move_up = True
			if event.key == pygame.K_a:
				move_left = True
			if event.key == pygame.K_d:
				move_right = True
			  
				                    
		if event.type == pygame.KEYUP:
			if event.key == pygame.K_s:
				move_down = False
			if event.key == pygame.K_w:
				move_up = False
			if event.key == pygame.K_a:
				move_left = False
			if event.key == pygame.K_d:
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
		fig.rotate(math.atan2(-dy, dx))
	g.background.fill((255, 255, 255))
	g.surface.blit(g.background, (0, 0))    	
	iter = 0
	while iter < len(enemies):
		ok = True
		enemies[iter].x += enemies[iter].dx
		enemies[iter].y += enemies[iter].dy
		iter_1 = 0
		while iter_1 < len(bullets):
			b = bullets[iter_1]
			if math.hypot(b.x + b.center[0] - enemies[iter].x - enemies[iter].center[0], b.y + b.center[1] - enemies[iter].y - enemies[iter].center[1]) < b.size + enemies[iter].size:
				del enemies[iter]
				del bullets[iter_1]
				iter -= 1
				ok = False
				score += 1
				break
			iter_1 += 1
		if ok:
			g.surface.blit(enemies[iter].surface, (enemies[iter].x, enemies[iter].y))
		iter += 1
	iter = 0
	for e in enemies:
		if math.hypot(e.x + e.center[0] - tw.x - tw.center[0], e.y + e.center[1] - tw.y - tw.center[1]) < e.size + tw.size - 10:
			del enemies[iter]
			print('Game Over')
			pygame.quit()
			exit()
			break
		iter += 1

	fig.x += dx
	fig.y += dy  
	g.surface.blit(fig.surface, (fig.x, fig.y))
	iter = 0
	while iter < len(bullets):
		if bullets[iter].x < 0 or bullets[iter].y < 0 or bullets[iter].x >= g.width or bullets[iter].y >= g.height:
			del bullets[iter]
			iter -= 1
		else:
			bullets[iter].x += bullets[iter].dx
			bullets[iter].y += bullets[iter].dy
			g.surface.blit(bullets[iter].surface, (bullets[iter].x, bullets[iter].y))
		iter += 1
				
	g.surface.blit(tw.surface, (tw.x, tw.y))
	pygame.display.set_caption('Score: ' + str(score))	
	pygame.display.flip()

	time.sleep(1 / FPS)
