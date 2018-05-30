from cx_Freeze import setup, Executable

setup(name = 'KEK',
	  version = '1.0',
	  description = '',
	  executables = [Executable('server.py')])