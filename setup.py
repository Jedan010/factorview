from setuptools import setup, find_packages

setup(
    name='factorview',
    version='0.1.0',
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        'Flask==2.3.2',
        'Flask-SQLAlchemy==3.0.5',
        'Flask-WTF==1.1.1',
        'Flask-Login==0.6.2',
        'Flask-Migrate==4.0.4',
        'Flask-Cors==3.0.10',
        'python-dotenv==1.0.0'
    ],
    package_data={
        'factorview': [
            'static/css/*',
            'static/js/*',
            'templates/*'
        ]
    },
    entry_points={
        'console_scripts': [
            'factorview=factorview.app:main'
        ]
    },
    python_requires='>=3.8',
)
