FROM php:7.4-apache
WORKDIR /var/www/html

# 必要最低限のPHP拡張とNode.jsのインストール
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get update \
  && apt-get install -y libzip-dev libpq-dev mariadb-client unzip git libfreetype6-dev libjpeg62-turbo-dev libpng-dev \
  && docker-php-ext-configure gd --with-freetype=/usr/include/ --with-jpeg=/usr/include/ \
  && docker-php-ext-install zip pdo_mysql mysqli gd exif opcache \
  && a2enmod rewrite \
  && apt-get -y install vim \
  && apt-get install -y nodejs \
  && git clone https://github.com/phpredis/phpredis.git /usr/src/php/ext/redis \
  && docker-php-ext-install redis 

EXPOSE 80

ENV COMPOSER_ALLOW_SUPERUSER 1
ENV COMPOSER_HOME /composer
ENV PATH $PATH:/composer/vendor/bin
ENV APACHE_LOG_DIR /var/log/apache2

# composerをインストール
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY ./apache/*.conf /etc/apache2/sites-enabled/
COPY ./php/php.ini /usr/local/etc/php/php.ini
COPY ./app /var/www/html

# composer install を高速化するためのライブラリをグローバルインストール
RUN composer global require hirak/prestissimo
RUN composer install --optimize-autoloader --no-dev
RUN php artisan key:generate  \
  && php artisan config:cache \
  && php artisan view:cache

RUN chmod 777 -R /var/www/html/storage/framework/

