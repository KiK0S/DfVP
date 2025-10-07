import pygame
import math
import constants
class Object:
	
	def __init__(self, x, y, tw, idx, name='', a = 40):         
		if name != '':
			self.surface = pygame.image.load(name + str(idx) + constants.PNG).convert_alpha()
		self.x = x               
		self.y = y
		self.idx = idx
		self.center = [a // 2, a // 2]
		self.size = a // 2
		self.speed = constants.ENEMY_SPEED
		self.dx = self.speed * (tw.x + tw.center[0] - self.x - self.center[0]) / math.hypot(self.x + self.center[0] - tw.x - tw.center[0], self.y + self.center[1] - tw.y - tw.center[1])
		self.dy = self.speed * (tw.y + tw.center[1] - self.y - self.center[1]) / math.hypot(self.x + self.center[0] - tw.x - tw.center[0], self.y + self.center[1] - tw.y - tw.center[1])