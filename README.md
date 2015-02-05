Criar um arquivo `credentials.php` com o seguinte conteúdo:

```php
<?php

return array(
    'host'  => 'http://[seu_host_aqui]/public/api.php',
    'token' => '[seu_api_token_aqui]',
);
```

Obviamente, sem o `[` e `]`.

Rodar `bower install` para instalar as dependências, que no momento são o `jquery`, `highcharts` e `knockout`.