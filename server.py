import socket
import handler
import time
import constants
import pygame
import sys
def run(conns):
	hand = handler.Object(len(conns))
	data = ''    
	clock = pygame.time.Clock()
	while True:              
		for conn in conns:
   			data = conn.recv(1024).decode('ascii')
   			if not data == '\n' and not data == '': 
   				for s in data.split('\n'):
   					if s == constants.STR_K:
   						break
   					try:
   						a, b, c = s.split(';')
   					except Exception:
   						print(s)
   					hand.handle(a, b, c)
		hand.update()
		for conn in conns:
			conn.send((hand.get() + constants.STR_K).encode('ascii'))
		if hand.end == 2:
			break
		hand.clear()
		clock.tick(constants.FPS)