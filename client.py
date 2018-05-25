import pygame
import socket
import pickle
sock = socket.socket()
sock.connect(('localhost', 9090))      	
sock.send(kek.encode('ascii'))
sock.close()	