## Scenario "Saint John"

**Objective:** Identify and terminate a program writing to `/var/log/bad.log`.

### Solution

1. **Analyze the log file** to identify the process:

   ```bash
   tail -f /var/log/bad.log
   ```

2. **Terminate the process** (the Python script):

   ```bash
   kill <PID>
   ```

3. **Verify** that the log file size stops increasing.


> [!IMPORTANT]
> Files uploaded in the sandbox are present in `/guest` directory


Check vpod
- GitHub: [https://github.com/capsulerun/vpod](https://github.com/capsulerun/vpod)
- Website: [https://vpod.sh](https://vpod.sh)

