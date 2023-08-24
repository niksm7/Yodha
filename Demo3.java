import com.java.addDataSecurityRule;
import com.java.createRowLevelDimensionFilter;
import com.java.addDataSecurityRulesMappingForUser;
import com.kyvos.commons.entity.olap.viewer.Filter;

Filter row_level_filters = createRowLevelDimensionFilter(CubeObject cubeObject, String dimensionName, String levelName, String operator, String value);

addDataSecurityRule(CubeObject cubeObject, String ruleName, String ruleDescription, row_level_filters, List<ColumnLevelSecurityField> columnLevelFields, UserInfo userInfo);

addDataSecurityRulesMappingForUser(CubeObject cubeObject, String userName, List<String> rulesNameList, UserInfo userInfo);
