import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function runSecurityAudit() {
    console.log('🔍 Running Security Audit...');

    try {
        const { stdout, stderr } = await execAsync('npm audit --json');
        const auditResult = JSON.parse(stdout);

        const vulnerabilities = auditResult.metadata.vulnerabilities;
        console.log('\n📊 Vulnerability Summary:');
        console.table(vulnerabilities);

        if (vulnerabilities.high > 0 || vulnerabilities.critical > 0) {
            console.error('\n❌ CRITICAL/HIGH Vulnerabilities found!');
            console.log('Run "npm audit fix" to address these issues immediately.');
            process.exit(1);
        } else {
            console.log('\n✅ No Critical or High vulnerabilities found.');
        }

    } catch (error: any) {
        // npm audit returns non-zero exit code if vulnerabilities are found
        if (error.stdout) {
            try {
                const auditResult = JSON.parse(error.stdout);
                const vulnerabilities = auditResult.metadata.vulnerabilities;
                console.log('\n📊 Vulnerability Summary (Alerts Found):');
                console.table(vulnerabilities);
                if (vulnerabilities.high > 0 || vulnerabilities.critical > 0) {
                    console.error('\n❌ CRITICAL/HIGH Vulnerabilities found!');
                    console.log('Run "npm audit fix" to address these issues immediately.');
                    process.exit(1);
                } else {
                    console.log('\n⚠️ Low/Moderate vulnerabilities found. Review "npm audit" output.');
                }
            } catch (e) {
                console.error('Error parsing audit output:', e);
            }
        } else {
            console.error('Error executing npm audit:', error.message);
        }
    }
}

runSecurityAudit();
