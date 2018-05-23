import pygame
class Game:
	def __init__(self,
				 #caption, 
				 width,
				 height,
				 frame_rate):
		self.frame_rate = frame_rate
		self.width = width
		self.height = height
		self.finish = False
		self.objects = []
		pygame.init()
		self.surface = pygame.display.set_mode((width, height))
		self.background = pygame.Surface(self.surface.get_size())
		#pygame.display.set_caption(caption)
		self.clock = pygame.time.Clock()