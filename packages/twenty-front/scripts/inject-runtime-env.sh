#!/bin/sh

echo "Injecting runtime environment variables into index.html..."

CONFIG_BLOCK=$(cat << EOF
    <script id="twenty-env-config">
      window._env_ = {
        REACT_APP_SERVER_BASE_URL: "$REACT_APP_SERVER_BASE_URL"
      };
    </script>
    <!-- END: Optale CRM Config -->
EOF
)
# Use sed to replace the config block in index.html
# Using pattern space to match across multiple lines
echo "$CONFIG_BLOCK" | sed -i.bak '
  /<!-- BEGIN: Optale CRM Config -->/,/<!-- END: Optale CRM Config -->/{
    /<!-- BEGIN: Optale CRM Config -->/!{
      /<!-- END: Optale CRM Config -->/!d
    }
    /<!-- BEGIN: Optale CRM Config -->/r /dev/stdin
    /<!-- END: Optale CRM Config -->/d
  }
' build/index.html
rm -f build/index.html.bak
