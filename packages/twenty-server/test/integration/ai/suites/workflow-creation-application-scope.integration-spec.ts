import { callMcpTool } from 'test/integration/graphql/suites/application-role-intersection/utils/call-mcp-tool.util';
import { getMcpToolCatalog } from 'test/integration/graphql/suites/application-role-intersection/utils/get-mcp-tool-catalog.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithResources,
  setupApplicationWithResources,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-resources.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const CREATE_WORKFLOW_TOOL_NAME = 'create_complete_workflow';
const LIST_WORKFLOWS_TOOL_NAME = 'list_workflows';

const listMcpWorkflowToolNames = async (token: string) => {
  const catalog = await getMcpToolCatalog({ token });

  return (catalog[ToolCategory.WORKFLOW] ?? []).map(({ name }) => name);
};

describe('Workflow creation outside the workspace custom application should be refused', () => {
  let application: ApplicationWithResources;
  let applicationToken: string;

  beforeAll(async () => {
    application = await setupApplicationWithResources({
      name: 'Workflow Creation Scope Probe',
    });

    const { applicationAccessToken } = await generateApplicationTokenPair({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      applicationId: application.id,
    });

    applicationToken = applicationAccessToken.token;
  }, 180000);

  afterAll(async () => {
    if (isDefined(application)) {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: application.universalIdentifier,
      });
    }
  });

  it('should let a user create workflows through MCP', async () => {
    expect(
      await listMcpWorkflowToolNames(APPLE_JANE_ADMIN_ACCESS_TOKEN),
    ).toContain(CREATE_WORKFLOW_TOOL_NAME);
  });

  it('should hide workflow creation from an installed application token', async () => {
    const workflowToolNames = await listMcpWorkflowToolNames(applicationToken);

    expect(workflowToolNames).toContain(LIST_WORKFLOWS_TOOL_NAME);
    expect(workflowToolNames).not.toContain(CREATE_WORKFLOW_TOOL_NAME);
  });

  it('should refuse workflow creation to an installed application token', async () => {
    const result = await callMcpTool({
      toolName: 'execute_tool',
      toolArguments: { toolName: CREATE_WORKFLOW_TOOL_NAME, arguments: {} },
      token: applicationToken,
    });

    expect(result.isError).toBe(true);
    expect(JSON.parse(result.content[0].text).message).toBe(
      `Tool "${CREATE_WORKFLOW_TOOL_NAME}" not found`,
    );
  });
});
