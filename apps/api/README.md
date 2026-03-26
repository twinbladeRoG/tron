# TRON - API

## Installing [Browser Use](https://docs.browser-use.com/)

```bash
uv add browser-use
uvx browser-use install
```

> Note: In some environment browser-use in unable to install browser dependencies like chromium or playwright, like Arch Linux. 

```bash
uv add playwright
uvx playwright install
uvx playwright install chromium
uvx playwright install-deps
```

> Note: On Arch, install-deps may not work perfectly since it's designed for Debian/Ubuntu. If you hit missing library errors, install them manually. Common ones:

```bash
sudo pacman -S nss nspr atk at-spi2-atk libdrm libxkbcommon \
  libxcomposite libxdamage libxfixes libxrandr mesa libgbm \
  alsa-lib cups libxss gtk3
```