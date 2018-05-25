import pygame
import socket
import pickle
sock = socket.socket()
sock.connect(('localhost', 9090))
kek = 'kek'    	
sock.send(kek.encode('ascii'))
data = sock.recv(1024)
sock.close()

print(data.decode('ascii'))	